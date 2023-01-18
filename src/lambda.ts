import AWS from "aws-sdk";
import AWSL from "aws-lambda";

const s3 = new AWS.S3();

export const resizePhoto: AWSL.S3Handler = async (event) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const data = await s3.getObject({ Bucket, Key }).promise();

  console.log("Raw text:\n" + data.Body?.toString("ascii"));

  const params = {
    Body: data.Body,
    Bucket: "photos-test-bug-resized",
    Key: Key,
  };
  await s3.putObject(params).promise();

  //console.log("damn boy");
};
