/**
 * UserMessage — renders a student's message as a right-aligned, tinted bubble.
 * Understated visual treatment to distinguish speaker without heavy chrome.
 */
export default function UserMessage({ message }) {
  return (
    <div className="flex justify-end mb-5">
      <div
        className="max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-md
                   text-[var(--text-body)] leading-relaxed"
        style={{
          backgroundColor: 'var(--color-primary-tint)',
          color: 'var(--color-text-primary)',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
