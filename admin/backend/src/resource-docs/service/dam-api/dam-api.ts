import axios from "axios";
import { createHash } from "crypto";
import { createReadStream } from "node:fs";
import * as FormData from "form-data";

const damUrl = "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/api/?";
const private_key =
  "eadf5671b31c517524b7c737b7b84bd365f40f96caa076cfc61891bd51f31363";
const user = "FBARRETA";

function sign(query) {
  return createHash("sha256").update(`${private_key}${query}`).digest("hex");
}

export async function getAllResources() {
  const searchParams = `${encodeURI("!collection739")}&restypes=${encodeURI("23,24,25,1,3,19,20,22,21")}`;
  const query = `user=${user}&function=do_search&search=${searchParams}`;
  return axios
    .get(`${damUrl}${query}&sign=${sign(query)}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function getResourceFiles(resource) {
  const query = `user=${user}&function=get_resource_all_image_sizes&resource=${resource}`;
  return axios
    .get(`${damUrl}${query}&sign=${sign(query)}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
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
  const formData = new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);

  return await axios
    .post(damUrl, formData, {
      headers: {
        "Content-Type": `multipart/form-data`, // Important: Set the correct Content-Type
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function uploadFile(ref, filePath) {
  const params: any = {
    user,
    function: "upload_multipart",
    ref,
    no_exif: false,
    revert: false,
  };
  const file = createReadStream(filePath);

  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData = new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);
  formData.append("file", file);

  console.log(formData);
  // Use createReadStream
  return await axios
    .post(damUrl, formData, {
      headers: {
        "Content-Type": `multipart/form-data`, // Important: Set the correct Content-Type
      },
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err.response.data);
      console.log(err.status);
    });
}

export async function uploadFile2(ref, filePath) {
  const params: any = {
    user,
    function: "upload_file",
    ref,
    no_exif: false,
    revert: false,
  };
  const file = createReadStream(filePath);

  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData = new FormData();
  formData.append("query", queryString);
  formData.append("sign", signature);
  formData.append("user", user);
  formData.append("file", file);

  console.log(formData);
  // Use createReadStream
  return await axios
    .post(damUrl, formData, {
      headers: {
        "Content-Type": `multipart/form-data`, // Important: Set the correct Content-Type
      },
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err.response.data);
      console.log(err.status);
    });
}
