import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080810]">
      {/* Sidebar — hidden on mobile, fixed on lg */}
      <Sidebar />

      {/* Main content area — offset by sidebar width on lg */}
      <div className="flex-1 flex flex-col lg:ml-[200px] min-h-screen">
        <Header />
        <main className="flex-1 px-4 sm:px-6 py-6">
          {children}
        </main>
        {/* Footer wrapper pushes the bottom up to prevent the mobile tab bar from covering it */}
        <div className="pb-20 lg:pb-0">
          <Footer />
        </div>
      </div>
    </div>
  );
}
