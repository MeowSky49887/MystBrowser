#pragma once

#include <napi.h>

#include <windows.h>
#include <uxtheme.h>
#include <dwmapi.h>

#include <cwchar>

namespace mystwin {
	static int WM_SPAWN_WORKER = 0x052C;

	static HWND progman = NULL;
	static HWND workerw = NULL;
	static HWND shelldll = NULL;

	bool Init(const Napi::Env env);
	Napi::Value Refresh(const Napi::CallbackInfo& info, std::string action);

	Napi::Value AttachAsWallpaperExport(const Napi::CallbackInfo& info);
	Napi::Value AttachAsDesktopExport(const Napi::CallbackInfo& info);
	Napi::Value AttachToTopExport(const Napi::CallbackInfo& info);
	Napi::Value DetachWindowExport(const Napi::CallbackInfo& info);
	Napi::Value SendToBackExport(const Napi::CallbackInfo& info);
	Napi::Value BringToFrontExport(const Napi::CallbackInfo& info);
	Napi::Value MoveWindowExport(const Napi::CallbackInfo& info);
	Napi::Value ResizeWindowExport(const Napi::CallbackInfo& info);
	// Napi::Value SetOpacityExport(const Napi::CallbackInfo& info);
	// Napi::Value ToggleFrameExport(const Napi::CallbackInfo& info);
	// Napi::Value ToggleOverlayExport(const Napi::CallbackInfo& info);
	// Napi::Value ToggleTaskBarExport(const Napi::CallbackInfo& info);

	enum WINDOWCOMPOSITIONATTRIB
	{
		WCA_UNDEFINED = 0,
		WCA_NCRENDERING_ENABLED = 1,
		WCA_NCRENDERING_POLICY = 2,
		WCA_TRANSITIONS_FORCEDISABLED = 3,
		WCA_ALLOW_NCPAINT = 4,
		WCA_CAPTION_BUTTON_BOUNDS = 5,
		WCA_NONCLIENT_RTL_LAYOUT = 6,
		WCA_FORCE_ICONIC_REPRESENTATION = 7,
		WCA_EXTENDED_FRAME_BOUNDS = 8,
		WCA_HAS_ICONIC_BITMAP = 9,
		WCA_THEME_ATTRIBUTES = 10,
		WCA_NCRENDERING_EXILED = 11,
		WCA_NCADORNMENTINFO = 12,
		WCA_EXCLUDED_FROM_LIVEPREVIEW = 13,
		WCA_VIDEO_OVERLAY_ACTIVE = 14,
		WCA_FORCE_ACTIVEWINDOW_APPEARANCE = 15,
		WCA_DISALLOW_PEEK = 16,
		WCA_CLOAK = 17,
		WCA_CLOAKED = 18,
		WCA_ACCENT_POLICY = 19,
		WCA_FREEZE_REPRESENTATION = 20,
		WCA_EVER_UNCLOAKED = 21,
		WCA_VISUAL_OWNER = 22,
		WCA_HOLOGRAPHIC = 23,
		WCA_EXCLUDED_FROM_DDA = 24,
		WCA_PASSIVEUPDATEMODE = 25,
		WCA_LAST = 26
	};

	enum ACCENTSTATE
	{
		ACCENT_DISABLED = 0,
		ACCENT_ENABLE_GRADIENT = 1,
		ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
		ACCENT_ENABLE_BLURBEHIND = 3,
		ACCENT_ENABLE_ACRYLICBLURBEHIND = 4, // RS4 1803.17063
		ACCENT_ENABLE_HOSTBACKDROP = 5, // RS5 1809
		ACCENT_INVALID_STATE = 6
	};

	struct WINDOWCOMPOSITIONATTRIBDATA
	{
		DWORD   Attrib;
		PVOID   pvData;
		SIZE_T  cbData;
	};

	struct ACCENTPOLICY
	{
		ACCENTSTATE accentState;
		DWORD       accentFlags;
		DWORD       gradientColor;
		DWORD       animationId;
	};

	typedef BOOL(WINAPI* pSetWindowCompositionAttribute)(
		IN HWND hwnd,
		IN WINDOWCOMPOSITIONATTRIBDATA* pwcad
	);

	typedef BOOL(WINAPI* pGetWindowCompositionAttribute)(
		IN HWND hwnd,
		OUT WINDOWCOMPOSITIONATTRIBDATA* pwcad
	);

	extern pSetWindowCompositionAttribute lSetWindowCompositionAttribute;
    extern pGetWindowCompositionAttribute lGetWindowCompositionAttribute;
}