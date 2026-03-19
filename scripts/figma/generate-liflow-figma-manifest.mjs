#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const OUTPUT_DIR = path.join(ROOT, "docs", "figma");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "liflow-figma-manifest.json");
const TARGET_ROUTES = 33;

const BREAKPOINTS = [
  { name: "Desktop", width: 1440 },
  { name: "Tablet", width: 1024 },
  { name: "Mobile", width: 390 },
];

const CRITICAL_STATE_MAP = {
  "/": "Loading/Skeleton",
  "/admin/applications": "Empty State",
  "/admin/bookings": "Empty State",
  "/admin/payments": "Empty State",
  "/admin/reports": "Loading/Skeleton",
  "/admin/reviews": "Empty State",
  "/admin/settings": "Validation Error",
  "/admin/users": "Empty State",
  "/apply-tutor": "Validation Error",
  "/auth/login": "Validation Error",
  "/auth/register": "Validation Error",
  "/auth/select-role": "Validation Error",
  "/dashboard": "Loading/Skeleton",
  "/dashboard/admin": "Loading/Skeleton",
  "/dashboard/guest": "Loading/Skeleton",
  "/dashboard/parent": "Loading/Skeleton",
  "/dashboard/tutor": "Loading/Skeleton",
  "/dashboard/tutor-candidate": "Loading/Skeleton",
  "/parent/bookings": "Empty State",
  "/parent/chats": "Empty State",
  "/parent/profile": "Validation Error",
  "/parent/wallet": "Empty State",
  "/tutor/availability": "Empty State",
  "/tutor/bookings": "Empty State",
  "/tutor/chats": "Empty State",
  "/tutor/profile": "Validation Error",
  "/tutor/reviews": "Empty State",
  "/tutor/schedule": "Empty State",
  "/tutor/wallet": "Empty State",
  "/tutor-application": "Validation Error",
  "/tutor-application/view": "Not Found/Error",
  "/tutors": "Empty State",
  "/tutors/[id]": "Not Found/Error",
};

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }

  return files;
}

function toRoute(pageFilePath) {
  const rel = path.relative(APP_DIR, pageFilePath).replaceAll("\\", "/");
  const routePart = rel.replace(/(^|\/)page\.tsx$/, "");
  return routePart === "" ? "/" : `/${routePart}`;
}

function buildFrames(route, criticalStateType) {
  const frames = [];
  for (const bp of BREAKPOINTS) {
    frames.push({
      route,
      breakpoint: bp.name,
      width: bp.width,
      state: "Default",
      stateType: "Default",
      name: `${route} | ${bp.name} | Default`,
    });
    frames.push({
      route,
      breakpoint: bp.name,
      width: bp.width,
      state: "Critical",
      stateType: criticalStateType,
      name: `${route} | ${bp.name} | Critical`,
    });
  }
  return frames;
}

async function main() {
  const files = await walk(APP_DIR);
  const pageFiles = files.filter((f) => f.endsWith("page.tsx"));
  const routes = [...new Set(pageFiles.map(toRoute))].sort();

  const unmappedRoutes = routes.filter((route) => !CRITICAL_STATE_MAP[route]);
  if (unmappedRoutes.length > 0) {
    throw new Error(
      `Missing critical-state mapping for routes:\n${unmappedRoutes.join("\n")}`
    );
  }

  const routeEntries = routes.map((route) => {
    const criticalStateType = CRITICAL_STATE_MAP[route];
    return {
      route,
      criticalStateType,
      states: ["Default", "Critical"],
      breakpoints: BREAKPOINTS.map((bp) => bp.name),
      frames: buildFrames(route, criticalStateType),
    };
  });

  const allFrames = routeEntries.flatMap((entry) => entry.frames);
  const expectedFramesByTarget = TARGET_ROUTES * BREAKPOINTS.length * 2;
  const expectedFramesByCurrentRoutes = routes.length * BREAKPOINTS.length * 2;

  const output = {
    generatedAt: new Date().toISOString(),
    assumptions: {
      targetRoutesFromPlan: TARGET_ROUTES,
      breakpoints: BREAKPOINTS,
      states: ["Default", "Critical"],
      namingContract: "/{route} | {Breakpoint} | {State}",
      theme: "light",
    },
    coverage: {
      currentRouteCount: routes.length,
      targetRouteCountFromPlan: TARGET_ROUTES,
      targetFrameCountFromPlan: expectedFramesByTarget,
      frameCountFromCurrentRoutes: expectedFramesByCurrentRoutes,
      generatedFrameCount: allFrames.length,
      routeDeltaVsPlan: routes.length - TARGET_ROUTES,
      frameDeltaVsPlan: allFrames.length - expectedFramesByTarget,
    },
    routes,
    routeEntries,
    frames: allFrames,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  console.log(`Wrote manifest: ${path.relative(ROOT, OUTPUT_FILE)}`);
  console.log(
    `Routes=${routes.length}, Frames=${allFrames.length}, DeltaFramesVsPlan=${output.coverage.frameDeltaVsPlan}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
