import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";

export default function LandingPageLayout({ children }) {
    return <>
        <div className="min-h-screen ">
            <Header />
            {children}
            <Footer />
        </div>
    </>
}