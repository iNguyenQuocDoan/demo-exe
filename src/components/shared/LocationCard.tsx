import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Info, Navigation } from "lucide-react";
import type { LocationInfo } from "@/types/booking-enhanced";

interface LocationCardProps {
  location: LocationInfo;
  isConfirmed: boolean;
  lang?: "vi" | "en";
  className?: string;
}

export function LocationCard({
  location,
  isConfirmed,
  lang = "vi",
  className,
}: LocationCardProps) {
  const openMap = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      "_blank",
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          {lang === "vi" ? "Địa điểm học" : "Learning Location"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Not confirmed - show limited info */}
        {!isConfirmed && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {lang === "vi"
                ? "Thông tin chi tiết sẽ hiển thị sau khi xác nhận buổi học"
                : "Detailed information will be shown after booking confirmation"}
            </AlertDescription>
          </Alert>
        )}

        {/* General area (always visible) */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {lang === "vi" ? "Khu vực" : "Area"}
              </p>
              <p className="text-sm text-muted-foreground">
                {location.district}, {location.city}
              </p>
            </div>
          </div>

          {!isConfirmed && (
            <Badge variant="secondary" className="text-xs">
              {lang === "vi" ? "Khu vực chung" : "General area only"}
            </Badge>
          )}
        </div>

        {/* Confirmed - show full address */}
        {isConfirmed && location.fullAddress && (
          <div className="space-y-3 p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">
                {lang === "vi" ? "Học trực tiếp" : "In-person Learning"}
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground">{location.fullAddress}</p>
              {location.landmark && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {location.landmark}
                </p>
              )}
            </div>

            {location.travelTimeEstimate && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Navigation className="h-3 w-3 mr-1" />
                  {lang === "vi" ? "≈" : "~"} {location.travelTimeEstimate}{" "}
                  {lang === "vi" ? "phút" : "min"}
                </Badge>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => openMap(location.fullAddress!)}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {lang === "vi" ? "Xem bản đồ" : "View on Map"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
