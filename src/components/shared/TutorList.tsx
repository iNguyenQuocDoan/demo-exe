import { TutorCard } from "@/components/shared/TutorCard";
import type { TutorProfile } from "@/types";

export function TutorList({
  tutors,
  subjectMap,
  districtMap,
}: {
  tutors: TutorProfile[];
  subjectMap: Record<string, string>;
  districtMap: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {tutors.map((tutor) => (
        <div key={tutor.id} className="pa-list-item min-h-full">
          <TutorCard
            tutor={tutor}
            subjectMap={subjectMap}
            districtMap={districtMap}
          />
        </div>
      ))}
    </div>
  );
}
