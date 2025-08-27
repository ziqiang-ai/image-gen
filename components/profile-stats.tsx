import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, Eye, Heart } from "lucide-react"

interface ProfileStatsProps {
  totalImages: number
  totalPublicImages: number
  totalLikes: number
}

export default function ProfileStats({ totalImages, totalPublicImages, totalLikes }: ProfileStatsProps) {
  const stats = [
    {
      label: "Total Creations",
      value: totalImages,
      icon: ImageIcon,
      color: "from-cyan-500 to-blue-600",
    },
    {
      label: "Public Images",
      value: totalPublicImages,
      icon: Eye,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Total Likes Received",
      value: totalLikes,
      icon: Heart,
      color: "from-pink-500 to-rose-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 text-center space-y-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto`}
            >
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-cyan-800">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
