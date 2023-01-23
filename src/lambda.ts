import AWS from "aws-sdk";
import AWSL from "aws-lambda";
import sharp from "sharp";
const s3 = new AWS.S3();

const textedSVG = Buffer.from(`<svg
    xmlns="http://www.w3.org/2000/svg" 
    xml:lang="en"
    height="40"
    width="200">
    <text
    font-family="MyFont"
    font-style="italic"
    x="0" y="20" font-size="16" fill="#fff">
    PHOTODROP
    </text></svg>`);

export const resizePhoto: AWSL.S3Handler = async (event) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const data = await s3.getObject({ Bucket, Key }).promise();

  //console.log("Raw text:\n" + data.Body?.toString("ascii"));
  const params2 = {
    Body: data.Body,
    Bucket: "photos-test-bug-resized",
    Key: "last-added.png",
  };
  await s3.putObject(params2).promise();

  if (typeof data.Body === "undefined") {
    throw Error("kek");
  }

  const outMini = await resizeToMini(<Buffer>data.Body);

  const paramsMini = {
    Body: outMini,
    Bucket: "photos-test-bug-resized",
    Key: "Resized.png",
  };
  await s3.putObject(paramsMini).promise();

  const outMarked = await putWatermark(<Buffer>data.Body, outMini);

  const paramsMarked = {
    Body: outMarked,
    Bucket: "photos-test-bug-resized",
    Key: "With-watermark.png",
  };
  await s3.putObject(paramsMarked).promise();

  //console.log("damn boy");
};

const resizeToMini = async (buffer: Buffer) => {
  const newBuffer = await sharp(buffer).resize(60, 80, { fit: "fill" }).toBuffer();
  return newBuffer;
};

const putWatermark = async (buffer: Buffer, watermark: Buffer) => {
  const newBuffer = await sharp(buffer)
    .composite([{ input: watermark, gravity: "southeast" }])
    .toBuffer();
  return newBuffer;
};
