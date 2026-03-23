import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "../ui";
import {
  maintenanceTicketSchema,
  MaintenanceTicketFormData,
} from "../../lib/validators";
import { TICKET_CATEGORIES } from "../../types";

interface TicketFormProps {
  onSubmit: (data: MaintenanceTicketFormData) => void | Promise<void>;
  loading?: boolean;
}

export function TicketForm({ onSubmit, loading }: TicketFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaintenanceTicketFormData>({
    resolver: zodResolver(maintenanceTicketSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
    },
  });

  const handleFormSubmit = async (data: MaintenanceTicketFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <View
      className="mb-6 bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <Text
        className="text-lg font-bold text-slate-900 mb-4"
        style={{ fontFamily: "Inter_700Bold" }}
      >
        Submit a Request
      </Text>

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Title"
            placeholder="Brief description of the issue"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
          />
        )}
      />

      <View className="mb-4">
        <Text className="text-sm font-semibold text-slate-700 mb-2">
          Category
        </Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2">
              {TICKET_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`
                    px-4 py-2.5 rounded-xl border
                    ${
                      value === cat
                        ? "bg-primary border-primary"
                        : "bg-slate-50 border-slate-200"
                    }
                  `}
                  onPress={() => onChange(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`
                      text-sm font-medium
                      ${value === cat ? "text-white" : "text-slate-600"}
                    `}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.category && (
          <Text className="text-xs text-error mt-2 font-medium">
            {errors.category.message}
          </Text>
        )}
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Description"
            placeholder="Provide more details about the issue..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.description?.message}
            multiline
            numberOfLines={4}
            className="h-24"
            style={{ textAlignVertical: "top" }}
          />
        )}
      />

      <Button
        title="Submit Request"
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        fullWidth
        icon="paper-plane"
      />
    </View>
  );
}
