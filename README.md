# psykedelia-lambda-thumbnail
Lambda functions for handling Psykedelia thumbnail creation from S3 bucket

### Environment variables
There are three required environment variables which should be set to lambda.

- `THUMB_PATH` S3 bucket path for storing the thumbnails without trailing slash (eg. 'thumbs')
- `THUMB_WIDTH` Width of the thumbnail image
- `THUMB_HEIGHT` Height of the thumbnail image

### NPM commands

- `npm run create-lambda` Creates zip package of the function code which can be deployed
- `npm run deploy` Deploys the lambda function to AWS