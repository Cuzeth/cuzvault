import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import Busboy from "busboy";
import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const parseFormData = (req: NextRequest): Promise<{ fields: Record<string, string>; files: string[] }> => {
  const busboy = Busboy({ headers: { 'content-type': req.headers.get('content-type') || '' } });
  const tmpdir = os.tmpdir();
  const fields: Record<string, string> = {};
  const fileWrites: Promise<string>[] = [];

  return new Promise((resolve, reject) => {
    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, info) => {
      const filename = info.filename;
      const filepath = path.join(tmpdir, filename);
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      const promise = new Promise<string>((resolve, reject) => {
        file.on('end', () => writeStream.end());
        writeStream.on('finish', () => resolve(filepath));
        writeStream.on('error', reject);
      });
      fileWrites.push(promise);
    });

    busboy.on('finish', async () => {
      try {
        const uploadedFilePaths = await Promise.all(fileWrites);
        resolve({ fields, files: uploadedFilePaths });
      } catch (error) {
        reject(error);
      }
    });

    busboy.on('error', reject);

    req.arrayBuffer().then((buffer) => {
      const stream = new Readable();
      stream.push(Buffer.from(buffer));
      stream.push(null);
      stream.pipe(busboy);
    }).catch(reject);
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const { fields, files } = await parseFormData(req);

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const uploadPromises = files.map(async (filePath) => {
      const fileContent = await fs.promises.readFile(filePath);
      const content = fileContent.toString("base64");
      const fileName = `uploads/${Date.now()}-${path.basename(filePath)}`;

      const response = await octokit.request(
        `PUT /repos/{owner}/{repo}/contents/{path}`,
        {
          owner: process.env.REPO_OWNER as string,
          repo: process.env.GITHUB_REPO as string,
          path: fileName,
          message: `Upload ${fileName}`,
          content,
        }
      );

      return response.data.content?.html_url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};