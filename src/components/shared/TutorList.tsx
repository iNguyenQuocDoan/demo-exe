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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {tutors.map((tutor) => (
        <TutorCard
          key={tutor.id}
          tutor={tutor}
          subjectMap={subjectMap}
          districtMap={districtMap}
        />
      ))}
    </div>
  );
}
