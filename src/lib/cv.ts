export async function loadImage(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const mat = cv.imread(img);
          resolve(mat);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function downscaleImage(mat: any, maxEdge: number = 1500): any {
  const width = mat.cols;
  const height = mat.rows;
  
  if (width <= maxEdge && height <= maxEdge) {
    return mat.clone();
  }

  let newWidth, newHeight;
  if (width > height) {
    newWidth = maxEdge;
    newHeight = Math.round((height * maxEdge) / width);
  } else {
    newHeight = maxEdge;
    newWidth = Math.round((width * maxEdge) / height);
  }

  const dsize = new cv.Size(newWidth, newHeight);
  const dst = new cv.Mat();
  cv.resize(mat, dst, dsize, 0, 0, cv.INTER_AREA);
  return dst;
}

export function preprocessImage(mat: any): any {
  const gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);

  const thresh = new cv.Mat();
  // Adaptive Threshold
  cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

  // Morphological cleanup
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const dilated = new cv.Mat();
  const cleaned = new cv.Mat();
  cv.dilate(thresh, dilated, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  cv.erode(dilated, cleaned, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

  gray.delete();
  thresh.delete();
  kernel.delete();
  dilated.delete();

  return cleaned;
}

export function findLargestContour(mat: any): { contour: any, boundingBox: any } | null {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let largestContour = null;
  let maxArea = 0;
  let boundingBox = null;

  for (let i = 0; i < contours.size(); ++i) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt);
    if (area > 100 && area > maxArea) {
      if (largestContour) largestContour.delete();
      largestContour = cnt.clone();
      maxArea = area;
      boundingBox = cv.boundingRect(cnt);
    }
    cnt.delete();
  }

  contours.delete();
  hierarchy.delete();

  if (largestContour) {
    return { contour: largestContour, boundingBox };
  }
  return null;
}

export function applyMask(mat: any, contour: any): any {
  const mask = cv.Mat.zeros(mat.rows, mat.cols, cv.CV_8UC1);
  const contours = new cv.MatVector();
  contours.push_back(contour);
  
  const color = new cv.Scalar(255);
  cv.drawContours(mask, contours, 0, color, cv.FILLED);
  
  const result = new cv.Mat();
  cv.bitwise_and(mat, mat, result, mask);
  
  mask.delete();
  contours.delete();
  return result;
}

export function cropToBoundingBox(mat: any, box: any): any {
  // Add margin
  const margin = 10;
  const x = Math.max(0, box.x - margin);
  const y = Math.max(0, box.y - margin);
  const w = Math.min(mat.cols - x, box.width + 2 * margin);
  const h = Math.min(mat.rows - y, box.height + 2 * margin);

  const rect = new cv.Rect(x, y, w, h);
  const cropped = mat.roi(rect);
  return cropped;
}
