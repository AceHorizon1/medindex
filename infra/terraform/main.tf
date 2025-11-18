terraform {
  required_version = ">= 1.8.0"
  required_providers {
    render = {
      source  = "render-oss/render"
      version = ">= 1.4.0"
    }
    netlify = {
      source  = "netlify/netlify"
      version = ">= 0.2.0"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
}

provider "netlify" {
  token = var.netlify_token
}

variable "render_api_key" {}
variable "netlify_token" {}
variable "netlify_site_id" {}

resource "netlify_build_hook" "medindex_api_sync" {
  site_id = var.netlify_site_id
  title   = "Trigger Render"
  url     = "https://api.render.com/deploy/srv-<id>"
}
