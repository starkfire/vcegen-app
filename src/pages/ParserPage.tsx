import { Outlet, useNavigation } from "react-router";
import { 
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { StagingPad } from "@/components/StagingPad";
import { ParserProvider, useParser } from "@/app/providers/parser"
import { ResetParserButton } from "@/components/ResetParserButton";
import { ExportOutputButton } from "@/components/ExportOutputButton";

function FallbackComponent() {
    return <p>Loading...</p>;
}

export default function ParserPage() {
    const { state } = useNavigation()

    return (
        <ParserProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
                        <div>
                            <SidebarTrigger className="-ml-1" />
                        </div>
                        <div className="[&>*]:ml-2">
                            <ResetParserButton />
                            <ExportOutputButton />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <StagingPad
                            className="min-h-[90vh] flex items-center justify-center" 
                            title="Upload Exam PDF"
                            description="Click this area or drag and drop a file to this pad to upload your file"
                        />
                    </div>
                    {/*
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="aspect-square rounded-xl bg-muted/50" />
                            ))}
                        </div>
                    </div>
                    */}
                </SidebarInset>
            </SidebarProvider>
        </ParserProvider>
    );
}