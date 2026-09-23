# Toolly Large PSD/PSB Worker

This worker is for multi-GB Photoshop documents that should not be loaded into browser RAM.

## What it does

- Accepts a streamed PSD/PSB upload at POST /convert.
- Writes the source document to disk.
- Runs ImageMagick from the worker host.
- Flattens the document onto a white background.
- Streams the resulting PDF back.
- Deletes the temporary source and output files after the response.

## Run

Build and start the container:

    docker build -t toolly-psd-worker ./worker
    docker run --rm -p 8080:8080 --memory=16g --cpus=4 --shm-size=2g toolly-psd-worker

For a ~4 GB PSB, give the worker plenty of disk space too. The worker itself should not be deployed as a Vercel serverless function; use a VM/container service that permits multi-GB streamed requests and long-running processes.

## Frontend

Set:

    NEXT_PUBLIC_PSD_WORKER_URL=https://your-worker.example.com

The browser sends the original File as the request body, so it does not create a second 4 GB JavaScript ArrayBuffer before upload.

## Important

PSB support and complex Photoshop features depend on the ImageMagick build/delegates available in the worker. Test with your actual PSB files before treating the service as production-ready.
