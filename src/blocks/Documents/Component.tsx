import { FileCard, type FileCardProps } from '@/components/cards/file-card'

/**
 * The documents section (issue #131, `docs/legacy-inventory.md` section 4): the cards side by
 * side from the medium width up, each opening its file in a new tab.
 */
export function Documents({ documents }: { documents: FileCardProps[] }) {
  return (
    <section data-section="documents">
      <div className="container gap-6 md:flex-row!">
        {documents.map((document) => (
          // Keyed by what a visitor reads rather than by the file: two documents can point at
          // one file, and two children with the same key is unsupported in React.
          <FileCard key={document.title} {...document} />
        ))}
      </div>
    </section>
  )
}
