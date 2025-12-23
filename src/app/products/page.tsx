import EntityManagementPage from "@/components/EntityManagementPage";

const previewImages = [
  {
    id: 1,
    image: "/images/references/prod-good-1.jpg",
    rotation: "-rotate-12",
    size: "h-40 w-32",
    z: "z-10",
    offset: "-mr-4",
  },
  {
    id: 2,
    image: "/images/references/prod-good-2.jpg",
    rotation: "rotate-3",
    size: "h-52 w-40",
    z: "z-20",
    offset: "-mr-6",
  },
  {
    id: 3,
    image: "/images/references/prod-good-3.jpg",
    rotation: "-rotate-6",
    size: "h-44 w-34",
    z: "z-30",
    offset: "-mr-3",
  },
  {
    id: 4,
    image: "/images/references/prod-good-4.jpg",
    rotation: "rotate-10",
    size: "h-48 w-36",
    z: "z-20",
    offset: "",
  },
];

const galleryImages = [
  { id: 1, image: "/images/references/prod-good-1.jpg" },
  { id: 2, image: "/images/references/prod-good-2.jpg" },
  { id: 3, image: "/images/references/prod-good-3.jpg" },
  { id: 4, image: "/images/references/prod-good-4.jpg" },
  { id: 5, image: "/images/references/prod-good-5.jpg" },
];

export default function Products() {
  return (
    <EntityManagementPage
      entityType="product"
      title="MAKE AI PRODUCT SHOTS"
      subtitle="Upload photos of your product. Get new shots with different backgrounds, lighting, angles."
      subtitle2="Works for images and videos. Good for ads, social posts, whatever you need"
      buttonText="Create Product Shot"
      buttonLoadingText="Creating..."
      deleteTitle="Delete Product"
      deleteMessage="Are you sure you want to delete this product? This action cannot be undone."
      generateUrlParam="products"
      previewImages={previewImages}
      galleryImages={galleryImages}
    />
  );
}
