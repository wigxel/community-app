type WorkItemProps = {
  position: string;
  company: string;
  timeline: string;
};
function WorkItem(props: WorkItemProps) {
  const { position, company, timeline } = props;

  return (
    <div className="flex justify-between text-sm">
      <div>
        <p className="font-medium text-white">{position}</p>
        <p className="text-white/60">{company}</p>
      </div>
      <p className="text-white/50">{timeline}</p>
    </div>
  );
}

export default WorkItem;
