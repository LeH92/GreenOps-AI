import Image from "next/image";

interface CompanyLogoProps {
  company: "aws" | "google-cloud" | "azure" | "openai" | "anthropic" | "google-ai";
  size?: number;
  className?: string;
}

const logoPaths = {
  aws: "/logos/aws.svg",
  "google-cloud": "/logos/google-cloud.svg",
  azure: "/logos/azure.svg",
  openai: "/logos/openai.svg",
  anthropic: "/logos/anthropic.svg",
  "google-ai": "/logos/google-ai.svg",
};

export function CompanyLogo({ company, size = 32, className = "" }: CompanyLogoProps) {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={logoPaths[company]}
        alt={`${company} logo`}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
}
