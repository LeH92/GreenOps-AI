"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  // FinOps & GreenOps Icons
  LayoutDashboard,
  TrendingUp,
  Plug,
  DollarSign,
  Activity,
  Target,
  Bell,
  FileText,
  Leaf,
  Zap,
  Settings,
  Key,
  Users,
  ChevronRight,
  // LLM & AI Icons
  Brain,
  MessageSquare,
  Image,
  Bot,
  Sparkles,
  // Cloud & Infrastructure Icons
  Cloud,
  Server,
  Database,
  Shield,
  // Environment & Carbon Icons
  TreePine,
  Recycle,
  BarChart3,
  PieChart,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/default",
        icon: LayoutDashboard
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: TrendingUp,
        isComing: true
      }
    ]
  },
  {
    title: "Cloud & Infrastructure",
    items: [
      {
        title: "Fournisseurs Cloud",
        href: "/dashboard/cloud-providers",
        icon: Cloud,
        items: [
          { title: "AWS", href: "/dashboard/cloud-providers/aws" },
          { title: "Google Cloud", href: "/dashboard/cloud-providers/gcp" },
          { title: "Azure", href: "/dashboard/cloud-providers/azure" }
        ]
      },
      {
        title: "Coûts & Usage",
        href: "/dashboard/costs",
        icon: DollarSign
      },
      {
        title: "Rapports d'Usage",
        href: "/dashboard/usage",
        icon: Activity
      }
    ]
  },
  {
    title: "Appels API",
    items: [
      {
        title: "Vue d'ensemble",
        href: "/dashboard/api-overview",
        icon: Activity,
        isDataBadge: "8.5K"
      },
      {
        title: "Historique des Appels",
        href: "/dashboard/api-history",
        icon: MessageSquare
      },
      {
        title: "Métriques API",
        href: "/dashboard/api-metrics",
        icon: BarChart3
      },
      {
        title: "Gestion des Tokens",
        href: "/dashboard/token-management",
        icon: Key
      }
    ]
  },
  {
    title: "IA & LLM",
    items: [
      {
        title: "Fournisseurs IA",
        href: "/dashboard/ai-providers",
        icon: Brain,
        items: [
          { title: "OpenAI", href: "/dashboard/ai-providers/openai" },
          { title: "Anthropic", href: "/dashboard/ai-providers/anthropic" },
          { title: "Google AI", href: "/dashboard/ai-providers/google-ai" }
        ]
      },

      {
        title: "Performance IA",
        href: "/dashboard/ai-performance",
        icon: Zap,
        isNew: true
      }
    ]
  },
  {
    title: "Contrôle Budgétaire",
    items: [
      {
        title: "Budgets",
        href: "/dashboard/budgets",
        icon: Target
      },
      {
        title: "Alertes",
        href: "/dashboard/alerts",
        icon: Bell,
        isDataBadge: "3"
      },
      {
        title: "Rapports",
        href: "/dashboard/reports",
        icon: FileText,
        isComing: true
      }
    ]
  },
  {
    title: "Environnement & Durabilité",
    items: [
      {
        title: "Empreinte Carbone",
        href: "/dashboard/carbon",
        icon: Leaf
      },
      {
        title: "Optimisation Verte",
        href: "/dashboard/green-optimization",
        icon: TreePine,
        isNew: true
      },
      {
        title: "Métriques Durables",
        href: "/dashboard/sustainability-metrics",
        icon: Recycle,
        isComing: true
      }
    ]
  },

  {
    title: "Configuration",
    items: [
      {
        title: "Paramètres",
        href: "/dashboard/pages/settings",
        icon: Settings,
        items: [
          { title: "Profil", href: "/dashboard/pages/settings" },
          { title: "Compte", href: "/dashboard/pages/settings/account" },
          { title: "Apparence", href: "/dashboard/pages/settings/appearance" },
          { title: "Notifications", href: "/dashboard/pages/settings/notifications" }
        ]
      },
      {
        title: "Clés API",
        href: "/dashboard/api-keys",
        icon: Key
      },
      {
        title: "Gestion d'Équipe",
        href: "/dashboard/team-management",
        icon: Users,
        isComing: true
      }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {navItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>
                              <Link href={item.href} className="block p-2 hover:bg-accent rounded">
                                {item.title} - Vue d'ensemble
                              </Link>
                            </DropdownMenuLabel>
                            {item.items?.map((subItem) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={subItem.title}>
                                <a href={subItem.href}>{subItem.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible className="group/collapsible block group-data-[collapsed=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}
                            asChild>
                            <Link href={item.href}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </Link>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item?.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild>
                                  <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild>
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="border border-gray-300 bg-gray-50 text-gray-600 peer-hover/menu-button:text-gray-600">
                      Bientôt
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge className="border border-green-500 bg-green-50 text-green-700 peer-hover/menu-button:text-green-700">
                      Nouveau
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="border border-blue-300 bg-blue-50 text-blue-700 peer-hover/menu-button:text-blue-700">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
