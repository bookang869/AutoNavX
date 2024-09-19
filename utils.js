// Linear interpolation
// A: first point
// B: second point
// t: percentage
// between A and B (0 to 100%)
function lerp(A, B, t) {
  return A + (B - A) * t;
}

// (A, B, t) and (C, D, u) are pairs
// Ix = Ax + (Bx - Ax)t = Cx + (Dx - Cx)u ... 1
// Iy = Ay + (By - Ay)t = Cy + (Dy - Cy)u ... 2

// From the first equation,
// (Ax - Cx) + (Bx - Ax)t = (Dx - Cx)u
// From the second equation,
// (Ay - Cy) + (By - Ay)t = (Dy - Cy)u
// (Dx - Cx)(Ay - Cy) + (Dx - Cx)(By - Ay)t = (Dy - Cy)(Dx - Cx)u
// Substituting ...1 in ...2
// (Dx - Cx)(Ay - Cy) + (Dx - Cx)(By - Ay)t = (Dy - Cy)[(Ax - Cx) + (Bx - Ax)t]
// (Dx - Cx)(Ay - Cy) + (Dx - Cx)(By - Ay)t = (Dy - Cy)(Ax - Cx) + (Dy - Cy)(Bx - Ax)t
// (Dx - Cx)(Ay - Cy) - (Dy - Cy)(Ax - Cx) = (Dy - Cy)(Bx - Ax) - (Dx - Cx)(By - Ay)t
// t = top / bottom where
// top =  (Dx - Cx)(Ay - Cy) - (Dy - Cy)(Ax - Cx)
// bottom = (Dy - Cy)(Bx - Ax) - (Dx - Cx)(By - Ay)

function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t
      }
    }
  }
  return null;
}

function polysIntersect(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      );
      if (touch) {
        return true;
      }
    }
  }
  return false;
}

function getRGBA(value) {
  // cyan = negative value
  // magenta = positive value
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = value > 0 ? 0 : 255;
  const B = 255;
  return "rgba("+R+", "+G+", "+B+", "+alpha+")";
}

function getRandomColor() {
  const hue = 290 + Math.random() * 260;
  return "hsl("+hue+", 100%, 60%)"; 
}