
export default function MarketsLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="mt-14 bg-[#0E0F14] h-[100vh]">    
            { children }
        </div>
    )
}