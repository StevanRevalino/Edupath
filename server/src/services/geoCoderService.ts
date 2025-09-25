import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({
  provider: "opencage",
  apiKey: process.env.OPENCAGE_API_KEY!, // set di .env
  
  language: "id",   // hasil berbahasa Indonesia
});

export default geocoder;