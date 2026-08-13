export default function UserMessage({ message }) {
  return (
    <div className="flex justify-end mb-4">
      <div
        className="max-w-[82%] sm:max-w-[68%] px-4 py-3 rounded-2xl rounded-br-sm
                   text-[var(--text-body)] leading-relaxed"
        style={{
          backgroundColor: 'var(--color-primary-tint)',
          color: 'var(--color-text-primary)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
