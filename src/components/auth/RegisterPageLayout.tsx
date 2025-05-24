
import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface RegisterPageLayoutProps {
  children: ReactNode;
}

const RegisterPageLayout = ({ children }: RegisterPageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="container max-w-md py-12">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterPageLayout;
