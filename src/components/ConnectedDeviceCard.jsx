import React from "react";

const ConnectedDeviceCard = ({ device }) => {
  const statusColor = device.connected ? "bg-green-500" : "bg-red-500";
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
      <div className="flex items-center space-x-4">
        <img
          src={device.logo}
          alt={device.name}
          className="w-10 h-10 object-contain"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{device.name}</h4>
          <p className="text-sm text-gray-500">{device.type}</p>
        </div>
      </div>
      <span
        className={`px-3 py-1 text-xs font-medium text-white rounded-full ${statusColor}`}
      >
        {device.connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
};

export default ConnectedDeviceCard;
