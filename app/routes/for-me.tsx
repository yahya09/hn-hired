import { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getLatestStories } from "~/models/story.server";
import { getFilteredItems } from "~/models/item-filtered.server";
import type { Story } from "~/models/story.server";

type StoryData = {
  story: Story;
  items: any[];
  itemsCount: number;
};

type LoaderData = {
  stories: StoryData[];
};

export const loader: LoaderFunction = async () => {
  const allStories = await getLatestStories();
  const stories: StoryData[] = [];

  for (const story of allStories) {
    const [itemsCount, items] = await getFilteredItems({ storyId: story.id });
    if (itemsCount > 0) {
      stories.push({ story, items, itemsCount });
    }
  }

  return json<LoaderData>({ stories });
};

export default function ForMe() {
  const { stories } = useLoaderData<LoaderData>();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = stories[selectedIdx];

  const totalMatches = stories.reduce((sum, s) => sum + s.itemsCount, 0);

  return (
    <div className="bg-slate-200 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-orange-500 px-4 py-4 text-white shadow-md">
        <div className="mx-auto flex items-center justify-between lg:max-w-5xl">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-orange-100 text-sm">
              ← All Posts
            </Link>
            <h1 className="text-lg font-bold">
              🎯 Remote Jobs For Me
            </h1>
          </div>
          <div className="text-sm opacity-90">
            {totalMatches} matches across {stories.length} months
          </div>
        </div>
      </header>

      {/* Month tabs */}
      <div className="mx-auto mt-4 lg:max-w-5xl px-4">
        <div className="flex gap-2 mb-4">
          {stories.map((s, idx) => (
            <button
              key={s.story.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                idx === selectedIdx
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-orange-50"
              }`}
            >
              {s.story.title.replace("Ask HN: Who is hiring? ", "")}
              <span className="ml-1 opacity-75">({s.itemsCount})</span>
            </button>
          ))}
        </div>

        {/* Filter description */}
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 mb-4">
          <strong>Filters:</strong> Remote (open to non-US/EU) · Software Engineer / Fullstack / Backend
        </div>
      </div>

      {/* Items */}
      <main className="relative h-[calc(100vh-200px)] overflow-scroll bg-slate-200 pb-10">
        <div className="mx-auto flex flex-col bg-stone-50 p-4 text-slate-700 lg:max-w-5xl">
          {!current || current.items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No matching jobs found.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {current.items.map((item: any) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {item.company && (
                      <span className="font-semibold text-orange-600">
                        {item.company}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      by {item.by} · {new Date(item.firebaseCreatedAt).toLocaleDateString()}
                    </span>
                    {item.remote && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Remote
                      </span>
                    )}
                    {item.contract && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        Contract
                      </span>
                    )}
                    {item.parttime && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Part-time
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags?.map((tag: any) => (
                      <span
                        key={tag.slug}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                      >
                        {tag.slug}
                      </span>
                    ))}
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 break-words"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                  <div className="mt-3 text-right">
                    <a
                      href={`https://news.ycombinator.com/item?id=${item.firebaseId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-500 hover:text-orange-600"
                    >
                      View on HN ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
