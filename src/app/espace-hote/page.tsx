"use client";
import dynamic from "next/dynamic";
import GuardHost from "@/components/auth/GuardHost";
const HostDashboard = dynamic(() => import("@/components/host/HostDashboard"), { ssr: false });
export default function Page(){ return <GuardHost><HostDashboard/></GuardHost>; }
