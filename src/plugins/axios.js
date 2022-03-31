import Bugsnag from "@bugsnag/js";
import axios from "axios";
import { ToastProgrammatic as Toast } from "buefy";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    Toast.open({
      message: "Something went wrong",
      type: "is-danger",
    });

    const message = [
      error.response.data?.error?.status,
      error.response.data?.error?.message,
    ].join(": ");

    Bugsnag.notify(message);

    console.log(message);

    throw error;
  }
);
