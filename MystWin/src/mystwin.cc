#include "mystwin.h"

namespace mystwin
{
    pSetWindowCompositionAttribute lSetWindowCompositionAttribute = nullptr;
    pGetWindowCompositionAttribute lGetWindowCompositionAttribute = nullptr;
}

struct WindowCache {
    HWND parent = NULL;
    HWND insert = NULL;
	uint32_t opacityValue = 255;
};
std::unordered_map<HWND, WindowCache> cacheMap;

bool mystwin::Init(const Napi::Env env) {
    progman = FindWindow(L"Progman", NULL);

    auto result = SendMessageTimeout(progman, WM_SPAWN_WORKER, 0, 0, SMTO_NORMAL, 1000, NULL);

	if (!result) {
		Napi::TypeError::New(env, "Cannot send message timeout.").ThrowAsJavaScriptException();
		return false;
	}

	EnumWindows([](HWND hwnd, LPARAM lParam) -> BOOL {
        shelldll = FindWindowEx(hwnd, NULL, L"SHELLDLL_DefView", NULL);
        if (shelldll) {
            *reinterpret_cast<HWND*>(lParam) = FindWindowEx(NULL, hwnd, L"WorkerW", NULL);
            return FALSE;
        }
        return TRUE;
    }, reinterpret_cast<LPARAM>(&workerw));

	if (shelldll == NULL) {
		shelldll = FindWindowEx(progman, NULL, L"SHELLDLL_DefView", NULL);
	}
	if (workerw == NULL) {
		workerw = FindWindowEx(progman, NULL, L"WorkerW", NULL);
	}

	return shelldll != NULL && workerw != NULL;
}

Napi::Value mystwin::Refresh(const Napi::CallbackInfo& info, std::string action) {
	auto env = info.Env();

	if (!info[0].IsBuffer()) {
		Napi::TypeError::New(env, "Invalid arguments").ThrowAsJavaScriptException();
		return env.Null();
	}

	auto windowHandleBuffer = info[0].As<Napi::Buffer<uint8_t>>().Data();
	LONG_PTR handle = *reinterpret_cast<LONG_PTR*>(windowHandleBuffer);
	HWND hwnd = (HWND)(LONG_PTR)handle;

	if (!Init(env)) {
		Napi::TypeError::New(env, "System Windows not found.").ThrowAsJavaScriptException();
		return env.Null();
	}

	auto& cache = cacheMap[hwnd];

	RECT rect;
	GetWindowRect(hwnd, &rect);

	int xPos = rect.left;
	int yPos = rect.top;
	int width = rect.right - rect.left;
	int height = rect.bottom - rect.top;

	LONG style = GetWindowLong(hwnd, GWL_STYLE);
	LONG exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);

	style |= WS_POPUP;
	exStyle |= WS_EX_LAYERED;

	HWND zOrder = NULL;

	if (info.Length() == 1) {
		if (action == "AttachAsWallpaper") {
			cache.insert = HWND_NOTOPMOST;
			cache.parent = workerw;
		} else if (action == "AttachAsDesktop") {
			cache.insert = HWND_NOTOPMOST;
			cache.parent = shelldll;
		} else if (action == "AttachToTop") {
			cache.parent = NULL;
			cache.insert = HWND_TOPMOST;
		} else if (action == "DetachWindow") {
			cache.parent = NULL;
			cache.insert = HWND_NOTOPMOST;
		} else if (action == "SendToBack") {
			zOrder = HWND_BOTTOM;
		} else if (action == "BringToFront") {
			zOrder = HWND_TOP;
		}
	// } else if (info.Length() == 2) {
	// 	if (action == "SetOpacity") {
	// 		cache.opacityValue = std::clamp<uint32_t>(info[1].As<Napi::Number>().Uint32Value(), 0u, 255u);
	// 	} else {
	// 		bool enable = info[1].As<Napi::Boolean>().Value();
	// 		 if (action == "ToggleFrame") {
	// 			if (enable) {
	// 				SetWindowLong(hwnd, GWL_STYLE, style | (WS_CAPTION | WS_THICKFRAME));
	// 			} else {
	// 				SetWindowLong(hwnd, GWL_STYLE, style & ~(WS_CAPTION | WS_THICKFRAME));
	// 			}
	// 		} else if (action == "ToggleOverlay") {
	// 			if (enable) {
	// 				SetWindowLong(hwnd, GWL_EXSTYLE, exStyle | WS_EX_TRANSPARENT);
	// 			} else {
	// 				SetWindowLong(hwnd, GWL_EXSTYLE, exStyle & ~WS_EX_TRANSPARENT);
	// 			}
	// 		} else if (action == "ToggleTaskBar") {
	// 			if (enable) {
	// 				SetWindowLong(hwnd, GWL_EXSTYLE, exStyle | WS_EX_TOOLWINDOW);
	// 			} else {
	// 				SetWindowLong(hwnd, GWL_EXSTYLE, exStyle & ~WS_EX_TOOLWINDOW);
	// 			}
	// 		} 
	// 		style = GetWindowLong(hwnd, GWL_STYLE);
	// 		exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
	// 	}
	} else if (info.Length() == 3) {
		if (action == "MoveWindow") {
			xPos = info[1].As<Napi::Number>().Int32Value();
			yPos = info[2].As<Napi::Number>().Int32Value();
		} else if (action == "ResizeWindow") {
			width = info[1].As<Napi::Number>().Int32Value();
			height = info[2].As<Napi::Number>().Int32Value();
		}
	} else {
		Napi::TypeError::New(env, "Invalid arguments").ThrowAsJavaScriptException();
		return env.Null();
	}

	BYTE opacity = static_cast<BYTE>(cache.opacityValue);

	SetParent(hwnd, cache.parent);
	SetWindowLong(hwnd, GWL_STYLE, style);
	SetWindowLong(hwnd, GWL_EXSTYLE, exStyle);
	// SetLayeredWindowAttributes(hwnd, 0, opacity, LWA_ALPHA);
	SetWindowPos(hwnd, NULL, 0, 0, 0, 0, SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOACTIVATE);
	SetWindowPos(hwnd, cache.insert, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
	SetWindowPos(hwnd, NULL, xPos, yPos, width, height, SWP_NOZORDER | SWP_NOACTIVATE);
	SetWindowPos(hwnd, zOrder, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);

	auto user32Lib = LoadLibrary(L"user32.dll");
	lSetWindowCompositionAttribute = (pSetWindowCompositionAttribute)GetProcAddress(user32Lib, "SetWindowCompositionAttribute");
	lGetWindowCompositionAttribute = (pGetWindowCompositionAttribute)GetProcAddress(user32Lib, "GetWindowCompositionAttribute");

	// ACCENTPOLICY policy{};
	// policy.accentState = ACCENT_ENABLE_BLURBEHIND;
	// policy.gradientColor = 0x00FFFFFF; // AA BB GG RR

	// WINDOWCOMPOSITIONATTRIBDATA data{};
	// data.Attrib = WCA_ACCENT_POLICY;
	// data.pvData = &policy;
	// data.cbData = sizeof(policy);

	// lSetWindowCompositionAttribute(hwnd, &data);

	return env.Null();
}

Napi::Value mystwin::AttachAsWallpaperExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "AttachAsWallpaper");
}

Napi::Value mystwin::AttachAsDesktopExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "AttachAsDesktop");
}

Napi::Value mystwin::AttachToTopExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "AttachToTop");
}

Napi::Value mystwin::DetachWindowExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "DetachWindow");
}

Napi::Value mystwin::SendToBackExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "SendToBack");
}

Napi::Value mystwin::BringToFrontExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "BringToFront");
}

Napi::Value mystwin::MoveWindowExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "MoveWindow");
}

Napi::Value mystwin::ResizeWindowExport(const Napi::CallbackInfo& info) {
	return Refresh(info, "ResizeWindow");
}

// Napi::Value mystwin::SetOpacityExport(const Napi::CallbackInfo& info) {
// 	return Refresh(info, "SetOpacity");
// }

// Napi::Value mystwin::ToggleFrameExport(const Napi::CallbackInfo& info) {
// 	return Refresh(info, "ToggleFrame");
// }

// Napi::Value mystwin::ToggleOverlayExport(const Napi::CallbackInfo& info) {
// 	return Refresh(info, "ToggleOverlay");
// }

// Napi::Value mystwin::ToggleTaskBarExport(const Napi::CallbackInfo& info) {
// 	return Refresh(info, "ToggleTaskBar");
// }