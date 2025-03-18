#include <assert.h>
#include "mystwin.h"
#include "napi.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set(Napi::String::New(env, "attachAsWallpaper"), Napi::Function::New(env, mystwin::AttachAsWallpaperExport));
	exports.Set(Napi::String::New(env, "attachAsDesktop"), Napi::Function::New(env, mystwin::AttachAsDesktopExport));
	exports.Set(Napi::String::New(env, "attachToTop"), Napi::Function::New(env, mystwin::AttachToTopExport));
	exports.Set(Napi::String::New(env, "detachWindow"), Napi::Function::New(env, mystwin::DetachWindowExport));
	exports.Set(Napi::String::New(env, "sendToBack"), Napi::Function::New(env, mystwin::SendToBackExport));
	exports.Set(Napi::String::New(env, "bringToFront"), Napi::Function::New(env, mystwin::BringToFrontExport));
	exports.Set(Napi::String::New(env, "moveWindow"), Napi::Function::New(env, mystwin::MoveWindowExport));
	exports.Set(Napi::String::New(env, "resizeWindow"), Napi::Function::New(env, mystwin::ResizeWindowExport));
	// exports.Set(Napi::String::New(env, "setOpacity"), Napi::Function::New(env, mystwin::SetOpacityExport));
	// exports.Set(Napi::String::New(env, "toggleFrame"), Napi::Function::New(env, mystwin::ToggleFrameExport));
	// exports.Set(Napi::String::New(env, "toggleOverlay"), Napi::Function::New(env, mystwin::ToggleOverlayExport));
	// exports.Set(Napi::String::New(env, "toggleTaskBar"), Napi::Function::New(env, mystwin::ToggleTaskBarExport));

	return exports;
}

NODE_API_MODULE(addon, Init)