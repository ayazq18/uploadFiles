import axios from "axios";

const API = axios.create({
    baseURL: "https://upload-files-backened.vercel.app",
    withCredentials: false,               // Allow cross-origin cookies for OAuth
  });

  export const updatePath = async (fileId, newPathref,from,to,toId,fromId,mail) => {
  try {
    const response = await API.put('/api/files/update-pathref', {
      id: fileId,
      from,
      to,
      newPathref: newPathref,
      toId,
      fromId,
      mail
    });
    console.log(response);
  } catch (error) {
    console.error("Error updating file pathref:", error);
    throw error;
  }
};
  
  export default API;