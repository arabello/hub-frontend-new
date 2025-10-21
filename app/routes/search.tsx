import type { Route } from "./+types/search";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { getPackagesIndex } from "../services/packages";
import { applyFilters, countTags } from "../services/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search Packages - Espanso Hub" },
    { name: "description", content: "Search and browse all Espanso packages" },
  ];
}

export async function loader() {
  const packagesIndex = await getPackagesIndex();
  return { packages: packagesIndex.packages };
}

export default function Search({
  loaderData: { packages },
}: Route.ComponentProps) {
  // Local state for text search (instant filtering, no URL)
  const [textQuery, setTextQuery] = useState("");

  // URL state for tag filtering (shareable)
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse tags from URL (?t=tag1,tag2)
  const selectedTags = searchParams.get("t")?.split(",").filter(Boolean) || [];

  // Apply filters
  const filteredPackages = applyFilters(packages, textQuery, selectedTags);

  // Get tag counts for filter UI
  const tagCounts = countTags(packages);

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    const newTags = selectedTags.includes(lowerTag)
      ? selectedTags.filter((t) => t !== lowerTag)
      : [...selectedTags, lowerTag];

    if (newTags.length > 0) {
      setSearchParams({ t: newTags.sort().join(",") });
    } else {
      setSearchParams({});
    }
  };

  const clearAllFilters = () => {
    setTextQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = textQuery.trim() !== "" || selectedTags.length > 0;

  return (
    <div>
      <h1>Search Packages</h1>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Left Column - Tags */}
        <aside style={{ minWidth: "200px" }}>
          <h2>Filter by Tags</h2>
          <fieldset>
            <legend>Select tags to filter:</legend>
            {tagCounts.slice(0, 10).map(({ tag, count }) => (
              <div key={tag}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  {tag} ({count})
                </label>
              </div>
            ))}
          </fieldset>
        </aside>

        {/* Right Column - Search and Results */}
        <main style={{ flex: 1 }}>
          {/* Search Input Section */}
          <section>
            <h2>Text Search</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="search-input">Search:</label>
              <input
                id="search-input"
                type="text"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                placeholder="Search by name, author, description..."
              />
            </form>
          </section>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <section>
              <h3>Active Filters:</h3>
              <ul>
                {textQuery.trim() !== "" && <li>Text: "{textQuery}"</li>}
                {selectedTags.length > 0 && (
                  <li>Tags: {selectedTags.join(", ")}</li>
                )}
              </ul>
              <button type="button" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </section>
          )}

          {/* Results Section */}
          <section>
            <h2>
              Results ({filteredPackages.length} package
              {filteredPackages.length !== 1 ? "s" : ""})
            </h2>

            {filteredPackages.length > 0 ? (
              <ul>
                {filteredPackages.map((pkg) => (
                  <li key={pkg.id}>
                    <h3>{pkg.title}</h3>
                    <p>
                      <strong>Description:</strong> {pkg.description}
                    </p>
                    <p>
                      <strong>Author:</strong> {pkg.author}
                    </p>
                    <p>
                      <strong>Version:</strong> {pkg.version}
                    </p>
                    <p>
                      <strong>Tags:</strong> {pkg.tags.join(", ")}
                    </p>
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <p>No packages found matching your criteria.</p>
                <p>Try adjusting your search or clearing filters.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
