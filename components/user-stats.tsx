import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, Heart, Eye, FolderOpen } from "lucide-react"

interface UserStatsProps {
  totalImages: number
  publicImages: number
  totalLikes: number
  totalCollections: number
}

export default function UserStats({ totalImages, publicImages, totalLikes, totalCollections }: UserStatsProps) {
  const stats = [
    {
      label: "Total Images",
      value: totalImages,
      icon: ImageIcon,
      color: "from-cyan-500 to-blue-600",
    },
    {
      label: "Public Images",
      value: publicImages,
      icon: Eye,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Total Likes",
      value: totalLikes,
      icon: Heart,
      color: "from-pink-500 to-rose-600",
    },
    {
      label: "Collections",
      value: totalCollections,
      icon: FolderOpen,
      color: "from-purple-500 to-indigo-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 text-center space-y-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-cyan-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
