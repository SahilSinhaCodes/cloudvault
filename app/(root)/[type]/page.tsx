import React from "react";
import Sort from "@/components/Sort";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { getFileTypesParams, convertFileSize } from "@/lib/utils";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(type) as FileType[];

  const [files, totalSpace] = await Promise.all([
    getFiles({ types, searchText, sort }),
    getTotalSpaceUsed(),
  ]);

  let totalSizeForPage = 0;
  if (totalSpace) {
    switch (type) {
      case "images":
        totalSizeForPage = totalSpace.image.size;
        break;
      case "documents":
        totalSizeForPage = totalSpace.document.size;
        break;
      // --- THIS IS THE FIX ---
      case "media":
        totalSizeForPage = totalSpace.video.size + totalSpace.audio.size;
        break;
      // ----------------------
      case "others":
        totalSizeForPage = totalSpace.other.size;
        break;
      default:
        totalSizeForPage = 0;
    }
  }

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total:{" "}
            <span className="h5">{convertFileSize(totalSizeForPage)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {files && files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;