"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadAvatar,
  UpdateProfileData,
} from "@/lib/api/users";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  username: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user: authUser } = useAuthStore();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!authUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      country: profile?.country || "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        bio: profile.bio || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
      });
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => updateUserProfile(data),
    onSuccess: () => {
      refetch();
      setIsEditing(false);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (data) => {
      setAvatarPreview(data.url);
      refetch();
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateMutation.mutateAsync(data);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      await avatarMutation.mutateAsync(file);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Không tìm thấy profile
            </h2>
            <p className="text-yellow-700">
              Không thể tải thông tin profile của bạn.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-900">Trang cá nhân</span>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex items-end gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden shadow-lg flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={profile.username}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-400 rounded-full p-2 cursor-pointer hover:bg-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={avatarMutation.isPending}
                      className="hidden"
                    />
                    <span className="text-white text-lg">📷</span>
                  </label>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg opacity-90">@{profile.username}</p>
                <p className="text-sm opacity-75">{profile.email}</p>
              </div>

              {/* Edit Button */}
              <div className="ml-auto">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin cá nhân
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("firstName")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("lastName")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("username")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin liên hệ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      {...register("phone")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("city")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("address")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quốc gia
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      {...register("country")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiểu sử
                </label>
                <textarea
                  disabled={!isEditing}
                  {...register("bio")}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Thông tin tài khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-semibold text-gray-900">{profile.role}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <p className="font-semibold text-green-600">{profile.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email verified:</span>
                    <p className="font-semibold">
                      {profile.isEmailVerified ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày tạo:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              {isEditing && (
                <div className="flex gap-4 justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <Link
            href="/classes"
            className="inline-block px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition shadow-md border border-gray-200"
          >
            ← Quay lại danh sách lớp
          </Link>
        </div>
      </div>
    </div>
  );
}
