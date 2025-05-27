import sharp from "sharp";
import axios from "axios";
import fs from "fs/promises";
import ssim from "image-ssim";

// Download image from URL and save locally
const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const path = `./temp-${Date.now()}.jpg`;
    await fs.writeFile(path, response.data);
    console.log(`Downloaded image to ${path}`);
    return path;
  } catch (error) {
    console.error(`Image download failed for ${url}:`, error.message);
    return null;
  }
};

// Compare two images using SSIM
const compareImages = async (photo1, photo2) => {
  try {
    const photo1Path = await downloadImage(photo1);
    const photo2Path = await downloadImage(photo2);
    if (!photo1Path || !photo2Path) {
      console.log(`Skipping comparison: Invalid paths (${photo1Path}, ${photo2Path})`);
      return 0;
    }

    const image1 = await sharp(photo1Path)
      .resize(256, 256, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const image2 = await sharp(photo2Path)
      .resize(256, 256, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const img1Data = {
      width: image1.info.width,
      height: image1.info.height,
      channels: image1.info.channels,
      data: image1.data,
    };
    const img2Data = {
      width: image2.info.width,
      height: image2.info.height,
      channels: image2.info.channels,
      data: image2.data,
    };

    const { ssim: similarityScore } = ssim.compare(img1Data, img2Data);

    await fs.unlink(photo1Path).catch(() => console.log(`Failed to delete ${photo1Path}`));
    await fs.unlink(photo2Path).catch(() => console.log(`Failed to delete ${photo2Path}`));

    console.log(`Compared ${photo1} and ${photo2}: SSIM = ${similarityScore}`);
    return similarityScore || 0;
  } catch (error) {
    console.error(`Image comparison error for ${photo1} vs ${photo2}:`, error.message);
    return 0;
  }
};

const testPhotoMatching = async () => {
  const photo1 = "https://res.cloudinary.com/dq9nv66tj/image/upload/v1747423559/profile-photos/f4uqydwgfncw17ujttur.jpg";
  const photo2 = "https://res.cloudinary.com/dq9nv66tj/image/upload/v1743698528/profile-photos/tckgq12mtvyfkrnckexu.jpg";

  console.log("Starting photo comparison test...");
  const score = await compareImages(photo1, photo2);
  console.log(`Final SSIM Score: ${score}`);

  // Interpret the score
  if (score >= 0.8) {
    console.log("High similarity: Images are very similar.");
  } else if (score >= 0.5) {
    console.log("Moderate similarity: Images have some similarities.");
  } else {
    console.log("Low similarity: Images are significantly different.");
  }
};

// Run the test
testPhotoMatching().catch((error) => {
  console.error("Test failed:", error.message);
});