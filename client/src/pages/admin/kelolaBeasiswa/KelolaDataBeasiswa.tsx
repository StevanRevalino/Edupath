import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import warningIcon from "../../../assets/warning-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";
import AdminDataTable from "../components/AdminDataTable";
import BeasiswaFormModal from "./components/BeasiswaFormModal";
import { beasiswaService } from "../../../services/beasiswaService";
import {
  beasiswaSchema,
  type BeasiswaFormData,
} from "../../../schema/BeasiswaSchema";
import { uploadImageToCloudinary } from "../../../utils/cloudinary";

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

const KelolaDataBeasiswa = () => {
  const [beasiswaList, setBeasiswaList] = useState<Beasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeasiswa, setSelectedBeasiswa] = useState<Beasiswa | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof BeasiswaFormData, string>>
  >({});

  // Fetch beasiswa data
  useEffect(() => {
    fetchBeasiswa();
  }, []);

  const fetchBeasiswa = async () => {
    try {
      setLoading(true);
      const response = await beasiswaService.getAllBeasiswa();
      setBeasiswaList(response.data);
    } catch (error) {
      console.error("Error fetching beasiswa:", error);
      toast.error("Gagal mengambil data beasiswa");
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Clear image_url error when file is selected
        setErrors((prev) => ({ ...prev, image_url: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (beasiswa?: Beasiswa) => {
    if (beasiswa) {
      setSelectedBeasiswa(beasiswa);
      setFormData({
        title: beasiswa.title,
        link: beasiswa.link,
        image_url: beasiswa.image_url,
      });
      setImagePreview(beasiswa.image_url);
    } else {
      setSelectedBeasiswa(null);
      setFormData({
        title: "",
        link: "",
        image_url: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBeasiswa(null);
    setFormData({
      title: "",
      link: "",
      image_url: "",
    });
    setImageFile(null);
    setImagePreview("");
    setErrors({});
  };

  // Handle input change with validation
  const handleInputChange = (field: keyof BeasiswaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user types
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    try {
      const validationData = {
        ...formData,
        image_url:
          formData.image_url || (imageFile ? "uploaded_temp_placeholder" : ""),
      };

      await beasiswaSchema.validate(validationData, {
        abortEarly: false,
        context: { isEdit: !!selectedBeasiswa },
      });
      setErrors({});
      return true;
    } catch (err: any) {
      const validationErrors: Partial<Record<keyof BeasiswaFormData, string>> =
        {};

      if (err.inner) {
        err.inner.forEach((error: any) => {
          if (error.path) {
            validationErrors[error.path as keyof BeasiswaFormData] =
              error.message;
          }
        });
      }

      setErrors(validationErrors);

      // Show first error in toast
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }

      return false;
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validate form first
    const isValid = await validateForm();
    if (!isValid) return;

    // Check if image is required for new beasiswa
    if (!selectedBeasiswa && !imageFile) {
      setErrors((prev) => ({ ...prev, image_url: "Gambar harus diupload" }));
      toast.error("Gambar harus diupload");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = formData.image_url;

      // Upload new image if file is selected
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(
            imageFile,
            "edupath/beasiswa"
          );
        } catch (error: any) {
          toast.error(error.message || "Gagal mengupload gambar");
          setIsUploading(false);
          return;
        }
      }

      const payload = {
        title: formData.title.trim(),
        link: formData.link.trim(),
        image_url: imageUrl,
      };

      if (selectedBeasiswa) {
        // Update existing
        await beasiswaService.updateBeasiswa(
          selectedBeasiswa.beasiswa_id,
          payload
        );
        toast.success("Beasiswa berhasil diperbarui");
      } else {
        // Create new
        await beasiswaService.createBeasiswa(payload);
        toast.success("Beasiswa berhasil ditambahkan");
      }

      fetchBeasiswa();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving beasiswa:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan beasiswa");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (beasiswaId: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data beasiswa akan dihapus permanen",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "var(--primary)",
      imageUrl: warningIcon,
      imageWidth: 80,
      imageHeight: 90,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await beasiswaService.deleteBeasiswa(beasiswaId);

          setBeasiswaList(
            beasiswaList.filter((b) => b.beasiswa_id !== beasiswaId)
          );
          toast.success("Beasiswa berhasil dihapus");
        } catch (error) {
          toast.error("Gagal menghapus beasiswa");
        }
      }
    });
  };

  return (
    <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 flex flex-col overflow-hidden">
      <PageHeader
        title="Kelola Data Beasiswa"
        description="Kelola informasi beasiswa dan bantuan pendidikan"
      />

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Beasiswa
        </button>
      </div>

      {/* Table */}
      <DataTableContainer loading={loading}>
        <AdminDataTable
          columns={[
            {
              header: "No",
              accessor: (_, index) => index + 1,
            },
            {
              header: "Poster",
              accessor: (beasiswa) => (
                <img
                  src={beasiswa.image_url}
                  alt={beasiswa.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ),
            },
            {
              header: "Judul",
              accessor: "title",
            },
            {
              header: "Link",
              accessor: (beasiswa) => (
                <a
                  href={beasiswa.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Lihat Link
                  <ExternalLink size={14} />
                </a>
              ),
            },
            {
              header: "Tanggal Dibuat",
              accessor: (beasiswa) =>
                new Date(beasiswa.created_at).toLocaleDateString("id-ID"),
            },
            {
              header: "Aksi",
              accessor: (beasiswa) => (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(beasiswa);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(beasiswa.beasiswa_id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              ),
            },
          ]}
          data={beasiswaList}
          keyExtractor={(beasiswa) => beasiswa.beasiswa_id}
          emptyMessage="Belum ada data beasiswa"
        />
      </DataTableContainer>

      {/* Modal */}
      <BeasiswaFormModal
        isOpen={isModalOpen}
        selectedBeasiswa={selectedBeasiswa}
        formData={formData}
        imagePreview={imagePreview}
        isUploading={isUploading}
        errors={errors}
        onClose={handleCloseModal}
        onImageChange={handleImageChange}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default KelolaDataBeasiswa;
