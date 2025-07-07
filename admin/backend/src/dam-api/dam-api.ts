import axios from "axios";
import { createHash } from "crypto";
import { Readable } from "stream";
import FormData from "form-data";
import { HttpException } from "@nestjs/common";

const damUrl = `${process.env.DAM_URL}/api/?`;
const private_key = process.env.DAM_PRIVATE_KEY ?? "";
const user = process.env.DAM_USER ?? "";
const pdfCollectionId = process.env.DAM_RST_PDF_COLLECTION_ID ?? "";

enum DamErrors {
  ERR_CREATING_RESOURCE = 416,
  ERR_GETTING_RESOURCE_IMAGES = 417,
  ERR_ADDING_RESOURCE_TO_COLLECTION = 418,
  ERR_UPLOADING_FILE = 419,
  ERR_DELETING_RESOURCE = 420,
}

function sign(query) {
  return createHash("sha256").update(`${private_key}${query}`).digest("hex");
}

function createFormData(params) {
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData = new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);
  return formData;
}

async function axiosPost(formData) {
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

/**
 * Creates a new resource in the Digital Asset Management (DAM) system.
 * @param title The title of the resource to create.
 */
export async function createResource(title: string) {
  try {
    const params: any = {
      user,
      function: "create_resource",
      metadata: JSON.stringify({ title }),
      resource_type: 1,
      archive: 0,
    };
    const formData = createFormData(params);

    return await axiosPost(formData);
  } catch {
    throw new HttpException(
      "Error creating resource.",
      DamErrors.ERR_CREATING_RESOURCE,
    );
  }
}

export async function getResourcePath(resource: string) {
  try {
    const params: any = {
      user,
      function: "get_resource_all_image_sizes",
      resource,
    };
    const formData = createFormData(params);

    return await axiosPost(formData);
  } catch {
    throw new HttpException(
      "Error getting resource images.",
      DamErrors.ERR_GETTING_RESOURCE_IMAGES,
    );
  }
}

export async function addResourceToCollection(resource: string) {
  try {
    const params: any = {
      user,
      function: "add_resource_to_collection",
      resource,
      collection: pdfCollectionId,
    };
    const formData = createFormData(params);

    return await axiosPost(formData);
  } catch {
    throw new HttpException(
      "Error adding resource to collection.",
      DamErrors.ERR_ADDING_RESOURCE_TO_COLLECTION,
    );
  }
}

export async function uploadFile(ref: string, file: Express.Multer.File) {
  try {
    const params: any = {
      user,
      function: "upload_multipart",
      ref,
      no_exif: 1,
      revert: 0,
    };
    const stream = Readable.from(file.buffer);

    const formData = createFormData(params);
    formData.append("file", stream, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    return await axiosPost(formData);
  } catch {
    throw new HttpException(
      "Error uploading file.",
      DamErrors.ERR_UPLOADING_FILE,
    );
  }
}

export async function deleteResource(resource: string) {
  try {
    const params: any = {
      user,
      function: "delete_resource",
      resource,
    };
    const formData = createFormData(params);

    return await axiosPost(formData);
  } catch {
    throw new HttpException(
      "Error deleting resource.",
      DamErrors.ERR_DELETING_RESOURCE,
    );
  }
}
