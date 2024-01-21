const fs = require("node:fs");
const path = require("node:path");
const faceapi = require("face-api.js");

const getRootDir = (currentDir) => {
  while (!fs.existsSync(path.join(currentDir, "package.json"))) {
    currentDir = path.join(currentDir, "..");
  }
  return currentDir;
};

const LoadModels = async () => {
  const modelPath = path.join(getRootDir(__dirname), "/face_models");

  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
};

const uploadLabeledImages = async (images, label) => {
  try {
    const descriptions = [];
    // Loop through the images
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      // Read each face and save the face descriptions in the descriptions array
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);
    }
    const createFace = new FaceModel({
      label: label,
      descriptions: descriptions,
    });
    await createFace.save();
    return true;
  } catch (error) {
    return error;
  }
};

const getDescriptorsFromDB = async (image) => {
  let faces = await FaceModel.find();
  for (i = 0; i < faces.length; i++) {
    for (j = 0; j < faces[i].descriptions.length; j++) {
      faces[i].descriptions[j] = new Float32Array(
        Object.values(faces[i].descriptions[j])
      );
    }
    faces[i] = new faceapi.LabeledFaceDescriptors(
      faces[i].label,
      faces[i].descriptions
    );
  }
  const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);

  const img = await canvas.loadImage(image);
  let temp = faceapi.createCanvasFromMedia(img);
  // Process the image for the model
  const displaySize = { width: img.width, height: img.height };
  faceapi.matchDimensions(temp, displaySize);

  // Find matching faces
  const detections = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const results = resizedDetections.map((d) =>
    faceMatcher.findBestMatch(d.descriptor)
  );
  return results;
};

const createSearchQuery = (fields, value) => {
  const query = { $or: [] };

  for (const field of fields) {
    query.$or.push({
      ["$expr"]: {
        $regexMatch: {
          input: { $toString: `$${field}` },
          regex: new RegExp(value, "i"),
        },
      },
    });
  }

  return query;
};

const paginatedQuery = async (Model, query, select, page, limit, sort) => {
  const total = await Model.countDocuments(query);
  const pages = Math.ceil(total / limit) || 1;
  if (page > pages) page = pages;
  const startIdx = (page - 1) * limit;
  const results = { total: total, pages, page, result: [] };

  results.result = await Model.find(query)
    .select(select)
    .skip(startIdx)
    .limit(limit)
    .sort(sort)
    .lean();

  return results;
};

const removeDuplicateFromArray = (array) => {
  const dict = {};
  for (const ele of array) {
    dict[ele] = true;
  }

  return Object.keys(dict);
};

module.exports = {
  getRootDir,
  LoadModels,
  uploadLabeledImages,
  getDescriptorsFromDB,
  createSearchQuery,
  paginatedQuery,
  removeDuplicateFromArray,
};
