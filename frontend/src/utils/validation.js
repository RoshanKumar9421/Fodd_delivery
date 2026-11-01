import { z } from "zod";

export const WEATHER_OPTIONS = [
  { value: "Sunny", label: "☀️ Sunny", desc: "Clear sky, minimal delay" },
  { value: "Cloudy", label: "☁️ Cloudy", desc: "Overcast weather" },
  { value: "Windy", label: "💨 Windy", desc: "Breezy conditions" },
  { value: "Fog", label: "🌫️ Fog", desc: "Reduced visibility" },
  { value: "Stormy", label: "⛈️ Stormy", desc: "Rain & poor road traction" },
  { value: "Sandstorms", label: "🌪️ Sandstorms", desc: "Severe weather condition" },
];

export const TRAFFIC_OPTIONS = [
  { value: "Low", label: "🟢 Low Traffic", badge: "Fast" },
  { value: "Medium", label: "🟡 Medium Traffic", badge: "Moderate" },
  { value: "High", label: "🟠 High Traffic", badge: "Heavy" },
  { value: "Jam", label: "🔴 Jammed", badge: "Severe" },
];

export const ORDER_TYPE_OPTIONS = [
  { value: "Meal", label: "🍛 Meal", desc: "Standard cooked lunch/dinner" },
  { value: "Snack", label: "🍟 Snack", desc: "Fast food, quick prep" },
  { value: "Drinks", label: "🥤 Drinks", desc: "Beverages & shakes" },
  { value: "Buffet", label: "🍱 Buffet", desc: "Bulk or multi-pack order" },
];

export const VEHICLE_TYPE_OPTIONS = [
  { value: "motorcycle", label: "🏍️ Motorcycle" },
  { value: "scooter", label: "🛵 Scooter" },
  { value: "electric_scooter", label: "⚡ Electric Scooter" },
  { value: "bicycle", label: "🚲 Bicycle" },
];

export const FESTIVAL_OPTIONS = [
  { value: "No", label: "Regular Day" },
  { value: "Yes", label: "🎉 Festival / Holiday" },
];

export const CITY_OPTIONS = [
  { value: "Metropolitian", label: "🌆 Metropolitan" },
  { value: "Urban", label: "🏙️ Urban" },
  { value: "Semi-Urban", label: "🏡 Semi-Urban" },
];

export const MULTIPLE_DELIVERY_OPTIONS = [
  { value: 0, label: "0 (Direct single order)" },
  { value: 1, label: "1 parallel drop-off" },
  { value: 2, label: "2 parallel drop-offs" },
  { value: 3, label: "3 parallel drop-offs" },
];

export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export const deliveryFormSchema = z.object({
  delivery_person_age: z.coerce
    .number({ invalid_type_error: "Age must be a valid number" })
    .int("Age must be an integer")
    .min(18, "Minimum delivery person age is 18")
    .max(65, "Maximum delivery person age is 65"),

  delivery_person_ratings: z.coerce
    .number({ invalid_type_error: "Rating must be a number" })
    .min(1.0, "Rating cannot be lower than 1.0")
    .max(5.0, "Rating cannot exceed 5.0")
    .refine((val) => Number(val.toFixed(1)) === val, {
      message: "Max 1 decimal place (e.g. 4.7)",
    }),

  vehicle_condition: z.coerce
    .number({ invalid_type_error: "Condition must be a number" })
    .int("Vehicle condition must be an integer")
    .min(0, "Vehicle condition min is 0 (Poor)")
    .max(3, "Vehicle condition max is 3 (Excellent)"),

  multiple_deliveries: z.coerce
    .number({ invalid_type_error: "Multiple deliveries must be a number" })
    .int("Must be an integer")
    .min(0, "Cannot be negative")
    .max(3, "Max 3 multiple deliveries"),

  restaurant_latitude: z.coerce
    .number({ invalid_type_error: "Valid latitude required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  restaurant_longitude: z.coerce
    .number({ invalid_type_error: "Valid longitude required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  delivery_location_latitude: z.coerce
    .number({ invalid_type_error: "Valid latitude required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  delivery_location_longitude: z.coerce
    .number({ invalid_type_error: "Valid longitude required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  weather_conditions: z.enum(
    ["Sunny", "Stormy", "Sandstorms", "Windy", "Cloudy", "Fog"],
    { errorMap: () => ({ message: "Select a valid weather condition" }) }
  ),

  road_traffic_density: z.enum(["Low", "Medium", "High", "Jam"], {
    errorMap: () => ({ message: "Select traffic density" }),
  }),

  type_of_order: z.enum(["Meal", "Snack", "Drinks", "Buffet"], {
    errorMap: () => ({ message: "Select order type" }),
  }),

  type_of_vehicle: z.enum(
    ["motorcycle", "scooter", "electric_scooter", "bicycle"],
    { errorMap: () => ({ message: "Select vehicle type" }) }
  ),

  festival: z.enum(["No", "Yes"], {
    errorMap: () => ({ message: "Select festival state" }),
  }),

  city: z.enum(["Urban", "Metropolitian", "Semi-Urban"], {
    errorMap: () => ({ message: "Select city classification" }),
  }),

  order_hour: z.coerce
    .number()
    .int()
    .min(0, "Hour must be 0-23")
    .max(23, "Hour must be 0-23"),

  order_minute: z.coerce
    .number()
    .int()
    .min(0, "Minute must be 0-59")
    .max(59, "Minute must be 0-59"),

  picked_hour: z.coerce
    .number()
    .int()
    .min(0, "Hour must be 0-23")
    .max(23, "Hour must be 0-23"),

  picked_minute: z.coerce
    .number()
    .int()
    .min(0, "Minute must be 0-59")
    .max(59, "Minute must be 0-59"),

  order_day: z.coerce
    .number()
    .int()
    .min(1, "Day must be 1-31")
    .max(31, "Day must be 1-31"),

  order_month: z.coerce
    .number()
    .int()
    .min(1, "Month must be 1-12")
    .max(12, "Month must be 1-12"),

  order_dayofweek: z.coerce
    .number()
    .int()
    .min(0, "Day of week 0-6")
    .max(6, "Day of week 0-6"),
});

/**
 * Validates entire form data and returns { isValid, errors }
 */
export function validateFormData(data) {
  const result = deliveryFormSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {}, parsedData: result.data };
  }

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0];
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  return { isValid: false, errors: fieldErrors };
}

/**
 * Validates a single field
 */
export function validateField(name, value, _allData = {}) {

  try {
    const shape = deliveryFormSchema.shape[name];
    if (!shape) return null;
    const res = shape.safeParse(value);
    if (!res.success) {
      return res.error.issues[0]?.message || "Invalid value";
    }
    return null;
  } catch {
    return "Invalid input";
  }
}
