import React, { useState } from 'react';
import { ApiEndpointSpec, GeoLocation } from '../../types/maps';
import { API_ENDPOINTS } from '../../data/mockData';
import { Send, Copy, Check, Code, ShieldCheck, Terminal, Globe, ChevronRight } from 'lucide-react';

interface APIExplorerProps {
  locations: GeoLocation[];
  onLocationCreated?: (loc: GeoLocation) => void;
}

export const APIExplorer: React.FC<APIExplorerProps> = ({ locations, onLocationCreated }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointSpec>(API_ENDPOINTS[1]); // Default /locations
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(API_ENDPOINTS[1].samplePayload || {}, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    data: any;
  } | null>(() => ({
    status: 200,
    statusText: 'OK',
    durationMs: 14,
    data: API_ENDPOINTS[1].sampleResponse
  }));
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectEndpoint = (ep: ApiEndpointSpec) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.samplePayload || {}, null, 2));
    setResponseOutput({
      status: ep.method === 'POST' && ep.path === '/locations' ? 201 : 200,
      statusText: ep.method === 'POST' && ep.path === '/locations' ? 'Created' : 'OK',
      durationMs: 18,
      data: ep.sampleResponse
    });
  };

  const handleExecuteRequest = () => {
    setIsLoading(true);
    const start = performance.now();

    setTimeout(() => {
      let resultData: any = selectedEndpoint.sampleResponse;
      let statusCode = 200;
      let statusText = 'OK';

      if (selectedEndpoint.path === '/locations' && selectedEndpoint.method === 'GET') {
        resultData = {
          count: locations.length,
          total: locations.length,
          locations: locations.map(l => ({
            id: l.id,
            name: l.name,
            code: l.code,
            address: l.address,
            geometry: l.geom,
            status: l.status,
            layer: l.layer,
            source: l.source
          }))
        };
      } else if (selectedEndpoint.path === '/locations' && selectedEndpoint.method === 'POST') {
        statusCode = 201;
        statusText = 'Created';
        try {
          const body = JSON.parse(requestPayload);
          resultData = {
            id: crypto.randomUUID(),
            name: body.name || 'موقع جديد',
            code: body.code || `AZ-LOC-${Math.floor(Math.random() * 9000 + 1000)}`,
            geometry: body.geometry || { type: 'Point', coordinates: [29.949, 31.216] },
            status: 'active',
            source: body.source || { system: 'manual', external_id: 'EXT-01' }
          };
        } catch {
          resultData = selectedEndpoint.sampleResponse;
        }
      } else if (selectedEndpoint.path === '/locations/nearby') {
        resultData = {
          query_point: [29.949, 31.216],
          radius_meters: 5000,
          workspace_id: 'ws-alazab-eg-01',
          results_count: 5,
          items: locations.slice(0, 5).map(l => ({
            id: l.id,
            name: l.name,
            code: l.code,
            layer: l.layer,
            coordinates: l.geom.coordinates
          }))
        };
      }

      const duration = Math.round(performance.now() - start) + 12;
      setResponseOutput({
        status: statusCode,
        statusText,
        durationMs: duration,
        data: resultData
      });
      setIsLoading(false);
    }, 180);
  };

  const generateCurl = () => {
    const url = `https://api.alazab.com/maps/v1${selectedEndpoint.path}`;
    let curl = `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "Authorization: Bearer <ALAZAB_JWT_TOKEN>" \\\n  -H "X-Workspace-ID: ws-alazab-eg-01" \\\n  -H "Content-Type: application/json"`;

    if (selectedEndpoint.method !== 'GET' && requestPayload.trim() !== '{}') {
      curl += ` \\\n  -d '${requestPayload.replace(/\n/g, '')}'`;
    }

    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
      {/* API Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">بوابة واجهات برمجة التطبيقات Alazab Maps API v1</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                https://api.alazab.com/maps/v1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              17 نقطة نهاية موحدة (Endpoints) للبيانات المكانية، المسارات، الترميز الجغرافي، والتكامل مع ERPNext وUberFix
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCurl}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
        >
          {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCurl ? 'تم نسخ أمر cURL' : 'نسخ كود cURL'}</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Endpoints Sidebar List */}
        <div className="w-full lg:w-84 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-900/20 overflow-y-auto p-4 shrink-0 space-y-2">
          <div className="text-xs font-bold text-slate-400 mb-2 px-1">قائمة Endpoints المعتمدة (Section 6.1)</div>

          {API_ENDPOINTS.map((ep, idx) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            const methodColor =
              ep.method === 'GET'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : ep.method === 'POST'
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

            return (
              <button
                key={idx}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-right p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500/60 text-white shadow-md'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${methodColor}`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200 text-xs truncate" dir="ltr">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{ep.title_ar}</div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-amber-400 rotate-180' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Request / Response Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Active Endpoint Info Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                  selectedEndpoint.method === 'GET'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <div>
                <span className="font-mono text-sm font-bold text-white" dir="ltr">
                  https://api.alazab.com/maps/v1{selectedEndpoint.path}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEndpoint.description_ar}</p>
              </div>
            </div>

            <button
              onClick={handleExecuteRequest}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'جاري الاستدعاء...' : 'تنفيذ الطلب (Send)'}</span>
            </button>
          </div>

          {/* Split Pane: Request Body on top / Response on bottom */}
          <div className="flex-1 grid grid-rows-2 overflow-hidden">
            {/* Request Pane */}
            <div className="border-b border-slate-800 flex flex-col bg-slate-900/10 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">محتوى الطلب (Request Headers & Body)</span>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Auth: Bearer JWT</span>
                  <span>·</span>
                  <span>Content-Type: application/json</span>
                </div>
              </div>
              <textarea
                value={requestPayload}
                onChange={e => setRequestPayload(e.target.value)}
                placeholder="لا يتطلب هذا الاستدعاء جسم طلب (Body)"
                className="w-full flex-1 p-4 bg-transparent font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Response Pane */}
            <div className="flex flex-col bg-slate-950 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">الاستجابة (Response Payload)</span>
                  {responseOutput && (
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                        responseOutput.status < 300
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {responseOutput.status} {responseOutput.statusText}
                    </span>
                  )}
                </div>
                {responseOutput && (
                  <span className="text-[11px] font-mono text-slate-400">
                    الزمن: <strong className="text-emerald-400">{responseOutput.durationMs} ms</strong>
                  </span>
                )}
              </div>
              <pre className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-amber-200/90 leading-relaxed selection:bg-amber-500/30" dir="ltr">
                {responseOutput ? JSON.stringify(responseOutput.data, null, 2) : '// اضغط Send لعرض الاستجابة'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
