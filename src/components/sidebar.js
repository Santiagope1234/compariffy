"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  PenIcon,
  ChartAreaIcon,
  Icon,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { IoMdExit } from "react-icons/io";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/store/theme";

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const links = [
    {
      path: "/dashboard",
      title: "Dashboard",
      Icon: LayoutDashboard,
    },
    {
      path: "/dashboard/create",
      title: "Create",
      Icon: PenIcon,
    },
    {
      path: "/dashboard/edit",
      title: "Edit",
      Icon: Edit,
    },
    {
      path: "/dashboard/fields",
      title: "Fields",
      Icon: ChartAreaIcon,
    },
  ];

  const router = useRouter();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className='flex flex-col items-start justify-center gap-4'>
            <h2>Panel de administrador</h2>
            {links.map(({ path, title, Icon }) => {
              return (
                <Link href={path} key={path} className='flex gap-2'>
                  <Icon />
                  {title}
                </Link>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button
          onClick={() => {
            signOut(auth)
              .then(() => {
                router.push("/");
              })
              .catch((error) => {
                console.log(error.message);
              });
          }}>
          <IoMdExit size={25} />
        </button>
        <button onClick={toggleTheme}>{theme}</button>
      </SidebarFooter>
    </Sidebar>
  );
}
