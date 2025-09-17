import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./app/QueryProvider";
import AppRoutes from "./app/routes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <main>
                        <AppRoutes />
                    </main>
                    <footer className="border-t border-zinc-400 dark:border-zinc-800
                            bg-gray-200/90 dark:bg-zinc-900/60
                            py-6 text-center text-sm text-zinc-500 mt-auto">
                        <p>Table Time</p>
                        <br></br>
                        <p>Built and designed by Francisco Alvarado</p>
                        <br></br>
                        <p>All rights reserved ©</p>
                    </footer>
                </div>
            </BrowserRouter>
        </QueryProvider>
    </React.StrictMode>
);