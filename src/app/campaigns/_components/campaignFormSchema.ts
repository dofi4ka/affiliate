import {z} from "zod";

export default z.object({
  name: z
    .string({required_error: "Specify campaign name"})
    .min(2, {message: "Name must be at least 2 characters."}),
  budget: z
    .preprocess((val) => {
      if (val === "") return 0;
      return Number(val);
    }, z
    .number()
    .min(0, {message: "Budget cannot be less than zero"})),
  status: z.string({required_error: "Select campaign status"})
})