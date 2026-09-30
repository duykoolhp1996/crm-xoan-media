import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Đặt thanh trạng thái trong suốt hòa vào giao diện CRM
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0C0E12),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  if (Platform.isAndroid) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }

  runApp(const CrmXoanApp());
}

class CrmXoanApp extends StatelessWidget {
  const CrmXoanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CRM Xoăn Media',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0C0E12),
        primaryColor: const Color(0xFFB8F23D),
      ),
      home: const CrmWebViewScreen(),
    );
  }
}

class CrmWebViewScreen extends StatefulWidget {
  const CrmWebViewScreen({super.key});

  @override
  State<CrmWebViewScreen> createState() => _CrmWebViewScreenState();
}

class _CrmWebViewScreenState extends State<CrmWebViewScreen> {
  InAppWebViewController? webViewController;
  PullToRefreshController? pullToRefreshController;
  
  // URL deploy trực tuyến của CRM Xoăn Media
  final String crmWebUrl = "https://duykoolhp1996.github.io/crm-xoan-media/";

  double progress = 0;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();

    // Tính năng kéo để làm mới (Pull-to-refresh)
    pullToRefreshController = PullToRefreshController(
      settings: PullToRefreshSettings(
        color: const Color(0xFFB8F23D),
        backgroundColor: const Color(0xFF1E222B),
      ),
      onRefresh: () async {
        if (Platform.isAndroid) {
          webViewController?.reload();
        } else if (Platform.isIOS) {
          webViewController?.loadUrl(
            urlRequest: URLRequest(url: await webViewController?.getUrl()),
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      // Xử lý nút Back vật lý trên Android
      onWillPop: () async {
        if (webViewController != null) {
          if (await webViewController!.canGoBack()) {
            webViewController!.goBack();
            return false;
          }
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0C0E12),
        body: SafeArea(
          bottom: false,
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(crmWebUrl)),
                initialSettings: InAppWebViewSettings(
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  iframeAllowFullscreen: true,
                  supportZoom: false, // Tắt zoom 2 ngón để như native app
                  transparentBackground: true,
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  clearCache: false,
                  cacheEnabled: true,
                  // Hỗ trợ upload ảnh/camera chụp ảnh học sinh
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                ),
                pullToRefreshController: pullToRefreshController,
                onWebViewCreated: (controller) {
                  webViewController = controller;

                  // Cầu nối giao tiếp JavaScript Native Bridge
                  // Web React có thể gọi: window.flutter_inappwebview.callHandler('NativeAction', { action: 'vibrate' })
                  controller.addJavaScriptHandler(
                    handlerName: 'NativeAction',
                    callback: (args) {
                      final data = args.isNotEmpty ? args[0] : null;
                      if (data != null && data['action'] == 'vibrate') {
                        HapticFeedback.mediumImpact();
                      }
                      return {'status': 'success'};
                    },
                  );
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    isLoading = true;
                  });
                },
                onLoadStop: (controller, url) async {
                  pullToRefreshController?.endRefreshing();
                  setState(() {
                    isLoading = false;
                  });
                },
                onProgressChanged: (controller, progress) {
                  if (progress == 100) {
                    pullToRefreshController?.endRefreshing();
                  }
                  setState(() {
                    this.progress = progress / 100;
                  });
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  final uri = navigationAction.request.url;
                  if (uri != null) {
                    // Mở app bên ngoài đối với Zalo, SĐT tel:, Mail mailto:, Facebook
                    final scheme = uri.scheme;
                    if (scheme == 'tel' || scheme == 'mailto' || scheme == 'zalo' || uri.host.contains('facebook.com')) {
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                        return NavigationActionPolicy.CANCEL;
                      }
                    }
                  }
                  return NavigationActionPolicy.ALLOW;
                },
              ),

              // Thanh tiến trình tải màu xanh neon
              if (isLoading && progress < 1.0)
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.transparent,
                  color: const Color(0xFFB8F23D),
                  minHeight: 2.5,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
