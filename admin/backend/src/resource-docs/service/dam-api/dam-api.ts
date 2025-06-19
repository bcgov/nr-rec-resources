import axios from "axios";
import { createHash } from "crypto";
// import { createReadStream } from "fs";
import { Readable } from "stream";
import FormData from "form-data";

declare const window: any;
const NodeFormData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  typeof window === "undefined" ? require("form-data") : null;

const damUrl = `${process.env.DAM_URL}/api/?`;
const private_key = process.env.DAM_PRIVATE_KEY;
const user = process.env.DAM_USER;
const pdfCollectionId = process.env.DAM_RST_PDF_COLLECTION_ID;

function sign(query) {
  return createHash("sha256").update(`${private_key}${query}`).digest("hex");
}

export async function createResource() {
  const params: any = {
    user,
    function: "create_resource",
    resource_type: 1,
    archive: 0,
  };
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData =
    typeof window === "undefined" ? new NodeFormData() : new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);

  return await axios
    .post(damUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}

export async function getResourcePath(resource: string) {
  const params: any = {
    user,
    function: "get_resource_all_image_sizes",
    resource,
  };
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData =
    typeof window === "undefined" ? new NodeFormData() : new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);

  return await axios
    .post(damUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}

export async function addResourceToCollection(resource: string) {
  const params: any = {
    user,
    function: "add_resource_to_collection",
    resource,
    collection: pdfCollectionId,
  };
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData =
    typeof window === "undefined" ? new NodeFormData() : new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);

  return await axios
    .post(damUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}

export async function uploadFile(ref: string, file: Express.Multer.File) {
  const params: any = {
    user,
    function: "upload_multipart",
    ref,
    no_exif: 1,
    revert: 0,
  };
  const stream = Readable.from(file.buffer);

  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData =
    typeof window === "undefined" ? new NodeFormData() : new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);
  formData.append("file", stream, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  return await axios
    .post(damUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}

export async function deleteResource(resource: string) {
  const params: any = {
    user,
    function: "delete_resource",
    resource,
  };
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData =
    typeof window === "undefined" ? new NodeFormData() : new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);

  return await axios
    .post(damUrl, formData, {
      headers: formData.getHeaders(),
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}
