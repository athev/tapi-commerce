
import CategoryCard, { CategoryCardProps } from "../products/CategoryCard";

// Mock data
const categories: CategoryCardProps[] = [
  {
    id: "courses",
    title: "Khóa học",
    icon: "/placeholder.svg",
    count: 250,
  },
  {
    id: "software",
    title: "Phần mềm",
    icon: "/placeholder.svg",
    count: 180,
  },
  {
    id: "accounts",
    title: "Tài khoản",
    icon: "/placeholder.svg",
    count: 320,
  },
  {
    id: "services",
    title: "Dịch vụ",
    icon: "/placeholder.svg",
    count: 150,
  },
  {
    id: "email",
    title: "Email",
    icon: "/placeholder.svg",
    count: 90,
  },
  {
    id: "others",
    title: "Khác",
    icon: "/placeholder.svg",
    count: 75,
  },
];

const FeaturedCategories = () => {
  return (
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
