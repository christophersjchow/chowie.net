/* eslint-disable turbo/no-undeclared-env-vars */
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeRewrite from "rehype-rewrite";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

/* 
  We are doing some URL mumbo jumbo here to tell Astro what the URL of your website will be.
  In local development, your SEO meta tags will have localhost URL.
  In built production websites, your SEO meta tags should have your website URL.
  So we give our website URL here and the template will know what URL to use 
  for meta tags during build.
  If you don't know your website URL yet, don't worry about this
  and leave it empty or use localhost URL. It won't break anything.
*/

const SERVER_PORT = 3000;
// the url to access your blog during local development
const LOCALHOST_URL = `http://localhost:${SERVER_PORT}`;
// the url to access your blog after deploying it somewhere (Eg. Netlify)
const LIVE_URL = "https://chowie.net";
// this is the astro command your npm script runs
const SCRIPT = process.env.npm_lifecycle_script || "";
const isBuild = SCRIPT.includes("astro build");
let BASE_URL = LOCALHOST_URL;
// When you're building your site in local or in CI, you could just set your URL manually
if (isBuild) {
  BASE_URL = LIVE_URL;
}
function isPrimaryHeading(tag) {
  return ["h2"].includes(tag);
}
function isSecondaryHeading(tag) {
  return ["h3", "h4", "h5", "h6"].includes(tag);
}
function isHeading(tag) {
  return isPrimaryHeading(tag) || isSecondaryHeading(tag);
}
function rewriteHeadings(node) {
  const primaryHeadingClasses = "pl-6 relative block leading-[150%] after:absolute after:content-[''] after:w-2 after:h-full after:top-0 after:left-0 after:bg-primary-green";
  const secondaryHeadingClasses = "relative block leading-[150%]";
  if (node.type == "element" && isHeading(node.tagName)) {
    let headerClass = isPrimaryHeading(node.tagName) ? primaryHeadingClasses : secondaryHeadingClasses;
    node.children = [{
      type: "element",
      tagName: "span",
      properties: {
        class: headerClass
      },
      children: node.children
    }];
  }
}

// https://astro.build/config
export default defineConfig({
  server: {
    port: SERVER_PORT
  },
  site: BASE_URL,
  markdown: {
    syntaxHighlight: "prism",
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }]],
    rehypePlugins: [[rehypeRewrite, {
      rewrite: rewriteHeadings
    }]]
  },
  integrations: [mdx(), sitemap(), tailwind({
    config: {
      applyBaseStyles: false
    }
  })]
});