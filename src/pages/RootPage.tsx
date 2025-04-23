import { Outlet, useNavigation } from "react-router";

function FallbackComponent() {
    return <p>Loading...</p>;
}

export default function RootPage() {
    const { state } = useNavigation()

    return (
        <div className="min-h-screen">
            <main>
                { (state === "loading") ? <FallbackComponent /> : <Outlet /> }
            </main>
        </div>
    );
}